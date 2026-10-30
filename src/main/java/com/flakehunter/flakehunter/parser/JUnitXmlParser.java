package com.flakehunter.flakehunter.parser;

import com.flakehunter.flakehunter.model.TestResult;
import com.flakehunter.flakehunter.model.TestStatus;
import org.springframework.stereotype.Component;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
public class JUnitXmlParser {

    public List<TestResult> parse(InputStream xml, String repo, Long runId, String commitSha)
            throws Exception {

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        // Safety: refuse XML that declares external entities (XXE attacks)
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);

        Document doc = factory.newDocumentBuilder().parse(xml);
        NodeList cases = doc.getElementsByTagName("testcase");
        List<TestResult> results = new ArrayList<>();

        for (int i = 0; i < cases.getLength(); i++) {
            Element tc = (Element) cases.item(i);

            String className = tc.getAttribute("classname");
            String name = tc.getAttribute("name");
            String testName = className.isEmpty() ? name : className + "#" + name;

            TestStatus status = TestStatus.PASSED;
            String message = null;
            NodeList children = tc.getChildNodes();
            for (int j = 0; j < children.getLength(); j++) {
                if (!(children.item(j) instanceof Element child)) continue;
                switch (child.getTagName()) {
                    case "failure" -> { status = TestStatus.FAILED; message = child.getAttribute("message"); }
                    case "error"   -> { status = TestStatus.ERROR;  message = child.getAttribute("message"); }
                    case "skipped" -> status = TestStatus.SKIPPED;
                    default -> { }
                }
            }

            long durationMs = 0;
            String time = tc.getAttribute("time");
            if (!time.isEmpty()) {
                durationMs = Math.round(Double.parseDouble(time) * 1000);
            }

            results.add(TestResult.builder()
                    .repo(repo)
                    .runId(runId)
                    .commitSha(commitSha)
                    .testName(testName)
                    .status(status)
                    .durationMs(durationMs)
                    .errorMessage(message)
                    .build());
        }
        return results;
    }
}